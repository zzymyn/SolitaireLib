import { IGameOptions } from "./IGameOptions";

export abstract class GameOptionsBase implements IGameOptions {
    public abstract toURLSearchParams(): URLSearchParams;
}
