import { dataHandler } from "@milify/panel-kit/gateway";
import { allowedPaths } from "@/services/routes";

const handler = dataHandler("artist", allowedPaths);
export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
