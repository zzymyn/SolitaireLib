import prand from 'pure-rand';
import { Debug } from "../Debug";
import { Card } from "./Card";
import { DelayHint } from "./DelayHint";
import { ICard } from "./ICard";
import { IGameBase } from "./IGameBase";
import { IPile } from "./IPile";
import { Pile } from "./Pile";
import { UndoableOperation } from "./UndoableOperation";

export abstract class GameBase implements IGameBase {
    public cards: Card[] = [];
    public piles: Pile[] = [];

    public abstract get won(): boolean;
    public abstract get unwinnable(): boolean;

    private undoStack_: UndoableOperation[] = [];
    private redoStack_: UndoableOperation[] = [];
    private currentOperation_: UndoableOperation | null = null;

    public *restart(seed: number) {
        let rng = prand.mersenne(seed);
        this.undoStack_ = [];
        this.redoStack_ = [];
        this.currentOperation_ = null;
        yield* this.restart_(rng);
    }

    public *undo() {
        let undoOp = this.undoStack_.pop();
        if (undoOp) {
            undoOp.undo();
            this.redoStack_.push(undoOp);
        }
    }

    public *redo() {
        let redoOp = this.redoStack_.pop();
        if (redoOp) {
            redoOp.redo();
            this.undoStack_.push(redoOp);
        }
    }

    public getHint(): { card: ICard; pile: IPile; } {
        throw new Error("Method not implemented.");
    }

    public *pilePrimary(pile: IPile): Generator<DelayHint, void> {
        if (this.startOperation()) {
            if (!(pile instanceof Pile)) Debug.error();
            Debug.assert(this.piles.indexOf(pile) >= 0);
            yield* this.pilePrimary_(pile);
            this.commitOperation();
        }
    }

    public *pileSecondary(pile: IPile): Generator<DelayHint, void> {
        if (this.startOperation()) {
            if (!(pile instanceof Pile)) Debug.error();
            Debug.assert(this.piles.indexOf(pile) >= 0);
            yield* this.pileSecondary_(pile);
            this.commitOperation();
        }
    }

    public *cardPrimary(card: ICard): Generator<DelayHint, void> {
        if (this.startOperation()) {
            if (!(card instanceof Card)) Debug.error();
            Debug.assert(this.cards.indexOf(card) >= 0);
            yield* this.cardPrimary_(card);
            this.commitOperation();
        }
    }

    public *cardSecondary(card: ICard): Generator<DelayHint, void> {
        if (this.startOperation()) {
            if (!(card instanceof Card)) Debug.error();
            Debug.assert(this.cards.indexOf(card) >= 0);
            yield* this.cardSecondary_(card);
            this.commitOperation();
        }
    }

    public canDrag(card: ICard): { canDrag: boolean; alsoDrag: ICard[]; } {
        if (!(card instanceof Card)) Debug.error();
        Debug.assert(this.cards.indexOf(card) >= 0);
        return this.canDrag_(card);
    }

    public previewDrop(card: ICard, pile: IPile) {
        if (!(card instanceof Card)) Debug.error();
        if (!(pile instanceof Pile)) Debug.error();
        Debug.assert(this.cards.indexOf(card) >= 0);
        Debug.assert(this.piles.indexOf(pile) >= 0);
        return this.previewDrop_(card, pile);
    }

    public *dropCard(card: ICard, pile: IPile) {
        if (this.startOperation()) {
            if (!(card instanceof Card)) Debug.error();
            if (!(pile instanceof Pile)) Debug.error();
            Debug.assert(this.cards.indexOf(card) >= 0);
            Debug.assert(this.piles.indexOf(pile) >= 0);
            yield* this.dropCard_(card, pile);
            this.commitOperation();
        }
    }

    protected abstract restart_(rng: prand.RandomGenerator): Generator<DelayHint, void>;
    protected abstract cardPrimary_(card: Card): Generator<DelayHint, void>;
    protected abstract cardSecondary_(card: Card): Generator<DelayHint, void>;
    protected abstract pilePrimary_(pile: Pile): Generator<DelayHint, void>;
    protected abstract pileSecondary_(pile: Pile): Generator<DelayHint, void>;
    protected abstract canDrag_(card: Card): { canDrag: boolean; alsoDrag: Card[]; };
    protected abstract previewDrop_(card: Card, pile: Pile): boolean;
    protected abstract dropCard_(card: Card, pile: Pile): Generator<DelayHint, void>;

    private startOperation() {
        if (this.currentOperation_)
            return false;
        this.currentOperation_ = new UndoableOperation();
        return true;
    }

    public addUndoableOperation(redo: () => void, undo: () => void) {
        if (this.currentOperation_) {
            this.currentOperation_.addOperation(redo, undo);
        }
    }

    private commitOperation() {
        if (!this.currentOperation_)
            Debug.error();
        if (this.currentOperation_.length > 0) {
            this.undoStack_.push(this.currentOperation_);
            this.redoStack_ = [];
        }
        this.currentOperation_ = null;
    }
}