export const searchPage = {
  navToSearchPage: () => cy.visit('/search/all-namespaces'),
  chooseResourceType: (resource_type) => {
    cy.get('input[placeholder="Resources"]').clear().type(`${resource_type}`);
    cy.get(`label[id$="~${resource_type}"]`).click();
  },
  clearAllFilters: () => {
    cy.byButtonText('Clear all filters').click({force: true});
  },
}
