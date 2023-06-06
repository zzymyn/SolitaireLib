export const enum DelayHint {
    /** No delay at all. */
    None,

    /** A very short delay. */
    Quick,

    /** A delay long enough that previous card transitions have completed. */
    OneByOne,

    /** A delay long enough that the player notices it as a slight pause. */
    Settle,
}
