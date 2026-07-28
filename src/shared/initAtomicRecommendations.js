/**
 * Initialize Atomic Commerce Recommendation Interfaces with the given engine
 * @param {Object} commerceEngine - The commerce engine to initialize with
 */
export async function initAtomicRecommendations(commerceEngine) {
  await customElements.whenDefined("atomic-commerce-recommendation-interface");
  const recommendationInterfaces = document.querySelectorAll(
    "atomic-commerce-recommendation-interface"
  );

  for (const recommendationInterface of recommendationInterfaces) {
    await recommendationInterface.initializeWithEngine(commerceEngine);
    recommendationInterface.style.display = "";
  }

  const loader = document.getElementById("atomic-loader");
  if (loader) loader.remove();
}
