import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 4000);

const app = createApp();

app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});
