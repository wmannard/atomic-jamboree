/**
 * Initialize Atomic Commerce Interface with the given engine
 * @param {Object} commerceEngine - The commerce engine to initialize with
 */
export async function initAtomicCommerce(commerceEngine) {
  await customElements.whenDefined("atomic-commerce-interface");
  const commerceInterface = document.querySelector(
    "atomic-commerce-interface"
  );
  if (!commerceInterface) {
    throw new Error("Missing <atomic-commerce-interface> element in DOM.");
  }
  await commerceInterface.initializeWithEngine(commerceEngine);
  commerceInterface.executeFirstRequest();
}
