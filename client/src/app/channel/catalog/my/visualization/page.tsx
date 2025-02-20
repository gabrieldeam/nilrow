// app/channel/catalog/my/visualization/page.tsx

import VisualizationClient from "./VisualizationClient";

export default function VisualizationPage() {
  // Este componente roda no servidor (Server Component).
  // Ele apenas retorna o Client Component.
  return <VisualizationClient />;
}
