import log from "electron-log";
import { format } from "date-fns";

log.transports.file.fileName = `${format(new Date(), "yyyy-MM-dd")}.log`;
log.initialize({ spyRendererConsole: true });

export { log as logger };
