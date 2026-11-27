/** All graph question generators, by skill id. */
import { CURVE_GENERATORS } from "./curves";
import { LINE_GENERATORS } from "./lines";

export const GRAPH_GENERATORS = { ...LINE_GENERATORS, ...CURVE_GENERATORS };
