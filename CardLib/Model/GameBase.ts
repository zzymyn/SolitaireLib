import prand from 'pure-rand';
import { TypeEx } from '~CardLib/TypeEx';
import { Debug } from "../Debug";
import { Card } from "./Card";
import { DelayHint } from "./DelayHint";
import { GameSerializationContext } from './GameSerializationContext';
import { ICard } from "./ICard";
import { IGameBase } from "./IGameBase";
import { IPile } from "./IPile";
import { Pile } from "./Pile";
import { CompoundUndoableOperation } from "./Undoable/CompoundUndoableOperation";
import { IUndoableOperation } from './Undoable/IUndoableOperation';

const SAVE_DATA_FORMAT = 0;

export abstract class GameBase implements IGameBase {
    public cards: Card[] = [];
    public piles: Pile[] = [];

    private undoStack_: CompoundUndoableOperation[] = [];
    private redoStack_: CompoundUndoableOperation[] = [];
    private currentOperation_: CompoundUndoableOperation | undefined = undefined;

    public *restart(seed: number) {
        if (this.startOperation_()) {
            const rng = prand.mersenne(seed);
            yield* this.restart_(rng);
            this.commitOperation_();
            this.undoStack_ = [];
            this.redoStack_ = [];
        }
    }

    public get canUndo() { return this.undoStack_.length > 0; }

    public *undo() {
        const undoOp = this.undoStack_.pop();
        if (undoOp) {
            undoOp.undo();
            this.redoStack_.push(undoOp);
        }
    }

    public get canRedo() { return this.redoStack_.length > 0; }

    public *redo() {
        const redoOp = this.redoStack_.pop();
        if (redoOp) {
            redoOp.redo();
            this.undoStack_.push(redoOp);
        }
    }

    public getHint(): { card: ICard; pile: IPile; } {
        throw new Error("Method not implemented.");
    }

    public *pilePrimary(pile: IPile): Generator<DelayHint, void> {
        if (this.startOperation_()) {
            if (!(pile instanceof Pile)) Debug.error();
            Debug.assert(this.piles.indexOf(pile) >= 0);
            yield* this.pilePrimary_(pile);
            this.commitOperation_();
        }
    }

    public *pileSecondary(pile: IPile): Generator<DelayHint, void> {
        if (this.startOperation_()) {
            if (!(pile instanceof Pile)) Debug.error();
            Debug.assert(this.piles.indexOf(pile) >= 0);
            yield* this.pileSecondary_(pile);
            this.commitOperation_();
        }
    }

    public *cardPrimary(card: ICard): Generator<DelayHint, void> {
        if (this.startOperation_()) {
            if (!(card instanceof Card)) Debug.error();
            Debug.assert(this.cards.indexOf(card) >= 0);
            yield* this.cardPrimary_(card);
            this.commitOperation_();
        }
    }

    public *cardSecondary(card: ICard): Generator<DelayHint, void> {
        if (this.startOperation_()) {
            if (!(card instanceof Card)) Debug.error();
            Debug.assert(this.cards.indexOf(card) >= 0);
            yield* this.cardSecondary_(card);
            this.commitOperation_();
        }
    }

    public canDrag(card: ICard): { canDrag: boolean; extraCards: ICard[]; } {
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
        if (this.startOperation_()) {
            if (!(card instanceof Card)) Debug.error();
            if (!(pile instanceof Pile)) Debug.error();
            Debug.assert(this.cards.indexOf(card) >= 0);
            Debug.assert(this.piles.indexOf(pile) >= 0);
            yield* this.dropCard_(card, pile);
            this.commitOperation_();
        }
    }

    protected abstract restart_(rng: prand.RandomGenerator): Generator<DelayHint, void>;
    protected abstract cardPrimary_(card: Card): Generator<DelayHint, void>;
    protected abstract cardSecondary_(card: Card): Generator<DelayHint, void>;
    protected abstract pilePrimary_(pile: Pile): Generator<DelayHint, void>;
    protected abstract pileSecondary_(pile: Pile): Generator<DelayHint, void>;
    protected abstract canDrag_(card: Card): { canDrag: boolean; extraCards: Card[]; };
    protected abstract previewDrop_(card: Card, pile: Pile): boolean;
    protected abstract dropCard_(card: Card, pile: Pile): Generator<DelayHint, void>;

    private startOperation_() {
        if (this.currentOperation_)
            return false;
        this.currentOperation_ = new CompoundUndoableOperation();
        return true;
    }

    public addUndoableOperation(op: IUndoableOperation) {
        if (this.currentOperation_) {
            this.currentOperation_.addOperation(op);
        }
    }

    private commitOperation_() {
        if (!this.currentOperation_)
            Debug.error();
        if (this.currentOperation_.length > 0) {
            this.undoStack_.push(this.currentOperation_);
            this.redoStack_ = [];
        }
        this.currentOperation_ = undefined;
    }

    public serialize() {
        const context = this.createSerializationContext_();
        context.write(SAVE_DATA_FORMAT);
        for (const card of this.cards) {
            card.serializeState(context);
        }
        for (const pile of this.piles) {
            pile.serializeState(context);
        }
        return context.toJson();
    }

    public deserialize(json: string) {
        try {
            const context = this.createSerializationContext_();
            context.fromJson(json);

            if (context.read() !== SAVE_DATA_FORMAT)
                throw new Error();
            for (const card of this.cards) {
                card.deserializeState(context);
            }
            for (const pile of this.piles) {
                pile.deserializeState(context);
            }
            context.ensureAtEnd();
            this.undoStack_ = [];
            this.redoStack_ = [];
            return true;
        } catch (error) {
            return false;
        }
    }

    private createSerializationContext_() {
        const context = new GameSerializationContext();
        for (const card of this.cards) {
            context.addCard(card);
        }
        for (const pile of this.piles) {
            context.addPile(pile);
        }
        return context;
    }
}