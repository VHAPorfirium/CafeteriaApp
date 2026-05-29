package com.cafeteria.api.domain.enums;

import java.util.EnumSet;
import java.util.Set;

/**
 * Estados de um pedido. A máquina de estados é estrita:
 *
 * <pre>
 *   PENDING ──► PREPARING ──► READY ──► DELIVERED
 *      │           │            │
 *      └───────────┴────────────┴─────► CANCELLED
 * </pre>
 *
 * Estados terminais (DELIVERED / CANCELLED) não permitem mais transições.
 */
public enum OrderStatus {
    PENDING, PREPARING, READY, DELIVERED, CANCELLED;

    private static final Set<OrderStatus> TERMINAL = EnumSet.of(DELIVERED, CANCELLED);

    public boolean isTerminal() {
        return TERMINAL.contains(this);
    }

    public boolean canTransitionTo(OrderStatus next) {
        if (this.isTerminal()) return false;
        return switch (this) {
            case PENDING   -> next == PREPARING || next == CANCELLED;
            case PREPARING -> next == READY     || next == CANCELLED;
            case READY     -> next == DELIVERED || next == CANCELLED;
            default        -> false;
        };
    }
}
