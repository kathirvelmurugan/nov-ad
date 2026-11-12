/**
 * domReconciliationShield.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Prevents catastrophic DOM reconciliation crashes caused by Google Translate,
 * browser auto-translation, Grammarly, and other DOM-mutating browser extensions.
 *
 * Background:
 * Google Translate wraps text nodes in `<font>` tags. When React subsequently
 * attempts to reconcile children, it calls `parent.insertBefore(newNode, refNode)`.
 * Because Google Translate introduced intermediary `<font>` nodes, `refNode.parentNode`
 * is no longer `parent` (it's `<font>`), causing the browser to throw:
 *   "Failed to execute 'insertBefore' on 'Node': The node before which the new
 *    node is to be inserted is not a child of this node."
 *
 * Same applies to `removeChild` and `replaceChild`.
 *
 * This shield intercepts these three DOM methods and redirects the operation
 * to the actual parent or gracefully falls back, preventing crashes completely.
 */

let isShieldInstalled = false;

export function installDomReconciliationShield(): void {
  if (isShieldInstalled || typeof window === 'undefined' || typeof Node === 'undefined') {
    return;
  }
  isShieldInstalled = true;

  // 1. Shield insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        // Node was reparented (e.g. wrapped in <font> by Google Translate).
        // Safely insert before referenceNode in its real parent.
        return referenceNode.parentNode.insertBefore(newNode, referenceNode);
      }
      // Node was detached from DOM entirely; append to this container instead of crashing.
      return originalInsertBefore.call(this, newNode, null);
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };

  // 2. Shield removeChild
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child);
      }
      // Child is already detached from DOM; returning it prevents a fatal exception.
      return child;
    }
    return originalRemoveChild.call(this, child);
  };

  // 3. Shield replaceChild
  const originalReplaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function <T extends Node>(newChild: Node, oldChild: T): T {
    if (oldChild && oldChild.parentNode !== this) {
      if (oldChild.parentNode) {
        return oldChild.parentNode.replaceChild(newChild, oldChild) as T;
      }
      return originalInsertBefore.call(this, newChild, null) as T;
    }
    return originalReplaceChild.call(this, newChild, oldChild);
  };
}

// Auto-install on module evaluation
installDomReconciliationShield();
