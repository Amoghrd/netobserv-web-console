export const operatorHubPage = {
  // pass operator name that matches the Title on UI
  install: (name: string, csName: string, metrics: boolean = false) => {
    cy.visit(`/operatorhub/subscribe?pkg=${name}&catalog=${csName}&catalogNamespace=openshift-marketplace&targetNamespace=undefined`);
    // ignore warning pop up for community operators
    cy.get('body').then(body => {
      if (body.find('.modal-content').length) {
        cy.byTestID('confirm-action').click()
      }
    })
    if (metrics) {
      cy.get('#enable-monitoring-checkbox').should('exist').check()
    }
    cy.byTestID('Enable-radio-input').click()
    cy.byTestID('install-operator').trigger('click')
    cy.get('#operator-install-page').should('exist')

    cy.visit('k8s/all-namespaces/operators.coreos.com~v1alpha1~ClusterServiceVersion')

    cy.contains(name).parents('tr').within(() => {
      cy.byTestID("status-text", { timeout: 180000 }).should('have.text', "Succeeded")
    })
  }
};
