#!/usr/bin/env bash
set -e

JSON_MODE=false
ALLOW_EXISTING=false
SHORT_NAME=""
USE_TIMESTAMP=false
ARGS=()
i=1
while [ $i -le $# ]; do
    arg="${!i}"
    case "$arg" in
        --json) JSON_MODE=true ;;
        --allow-existing-branch) ALLOW_EXISTING=true ;;
        --short-name)
            i=$((i + 1)); SHORT_NAME="${!i}" ;;
        --timestamp) USE_TIMESTAMP=true ;;
        --help|-h)
            echo "Usage: $0 [--json] [--allow-existing-branch] [--short-name <name>] [--timestamp] <feature_description>"
            exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
    i=$((i + 1))
done

FEATURE_DESCRIPTION="${ARGS[*]}"
FEATURE_DESCRIPTION=$(echo "$FEATURE_DESCRIPTION" | xargs)
if [ -z "$FEATURE_DESCRIPTION" ]; then
    echo "Error: Feature description cannot be empty" >&2; exit 1
fi

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

REPO_ROOT=$(get_repo_root)
if has_git; then HAS_GIT=true; else HAS_GIT=false; fi
cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

clean_branch_name() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//'
}

get_highest_from_specs() {
    local highest=0
    if [ -d "$SPECS_DIR" ]; then
        for dir in "$SPECS_DIR"/*; do
            [ -d "$dir" ] || continue
            dirname=$(basename "$dir")
            if echo "$dirname" | grep -Eq '^[0-9]{3,}-' && ! echo "$dirname" | grep -Eq '^[0-9]{8}-[0-9]{6}-'; then
                number=$(echo "$dirname" | grep -Eo '^[0-9]+')
                number=$((10#$number))
                [ "$number" -gt "$highest" ] && highest=$number
            fi
        done
    fi
    echo "$highest"
}

get_next_number() {
    local highest
    if [ "$HAS_GIT" = true ]; then
        git fetch --all --prune >/dev/null 2>&1 || true
        local highest_branch=0
        while IFS= read -r branch; do
            clean_b=$(echo "$branch" | sed 's/^[* ]*//; s|^remotes/[^/]*/||')
            if echo "$clean_b" | grep -Eq '^[0-9]{3,}-' && ! echo "$clean_b" | grep -Eq '^[0-9]{8}-[0-9]{6}-'; then
                n=$(echo "$clean_b" | grep -Eo '^[0-9]+' || echo "0")
                n=$((10#$n))
                [ "$n" -gt "$highest_branch" ] && highest_branch=$n
            fi
        done < <(git branch -a 2>/dev/null || true)
        local highest_spec
        highest_spec=$(get_highest_from_specs)
        local max=$highest_branch
        [ "$highest_spec" -gt "$max" ] && max=$highest_spec
        echo $((max + 1))
    else
        local h; h=$(get_highest_from_specs)
        echo $((h + 1))
    fi
}

if [ -n "$SHORT_NAME" ]; then
    BRANCH_SUFFIX=$(clean_branch_name "$SHORT_NAME")
else
    BRANCH_SUFFIX=$(clean_branch_name "$FEATURE_DESCRIPTION" | tr '-' '\n' | head -3 | tr '\n' '-' | sed 's/-$//')
fi

if [ "$USE_TIMESTAMP" = true ]; then
    FEATURE_NUM=$(date +%Y%m%d-%H%M%S)
else
    BRANCH_NUMBER=$(get_next_number)
    FEATURE_NUM=$(printf "%03d" "$((10#$BRANCH_NUMBER))")
fi

BRANCH_NAME="${FEATURE_NUM}-${BRANCH_SUFFIX}"

if [ "$HAS_GIT" = true ]; then
    if ! git checkout -b "$BRANCH_NAME" 2>/dev/null; then
        if git branch --list "$BRANCH_NAME" | grep -q .; then
            if [ "$ALLOW_EXISTING" = true ]; then
                git checkout "$BRANCH_NAME" 2>/dev/null || { echo "Error: Failed to switch to $BRANCH_NAME" >&2; exit 1; }
            else
                echo "Error: Branch '$BRANCH_NAME' already exists." >&2; exit 1
            fi
        else
            echo "Error: Failed to create git branch '$BRANCH_NAME'." >&2; exit 1
        fi
    fi
fi

FEATURE_DIR="$SPECS_DIR/$BRANCH_NAME"
mkdir -p "$FEATURE_DIR"

SPEC_FILE="$FEATURE_DIR/spec.md"
if [ ! -f "$SPEC_FILE" ]; then
    TEMPLATE=$(resolve_template "spec-template" "$REPO_ROOT") || true
    if [ -n "$TEMPLATE" ] && [ -f "$TEMPLATE" ]; then
        cp "$TEMPLATE" "$SPEC_FILE"
    else
        touch "$SPEC_FILE"
    fi
fi

printf '# To persist: export SPECIFY_FEATURE=%q\n' "$BRANCH_NAME" >&2

if $JSON_MODE; then
    if has_jq; then
        jq -cn \
            --arg branch_name "$BRANCH_NAME" \
            --arg spec_file "$SPEC_FILE" \
            --arg feature_num "$FEATURE_NUM" \
            '{BRANCH_NAME:$branch_name,SPEC_FILE:$spec_file,FEATURE_NUM:$feature_num}'
    else
        printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","FEATURE_NUM":"%s"}\n' \
            "$(json_escape "$BRANCH_NAME")" "$(json_escape "$SPEC_FILE")" "$(json_escape "$FEATURE_NUM")"
    fi
else
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "SPEC_FILE: $SPEC_FILE"
    echo "FEATURE_NUM: $FEATURE_NUM"
fi
