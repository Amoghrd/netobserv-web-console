export namespace networkHealthSelectors {
    export const global = '[id^="pf-tab-global"]'
    export const node = '[id^="pf-tab-per-node"]'
    export const namespace = '[id^="pf-tab-per-namespace"]'
    export const workload = '[id^="pf-tab-per-owner"]'
    export const nodeCard = '[data-test^="health-card-"]'
    export const sidePanel = '.health-gallery-drawer-content'
}


export const networkHealth = {
    clickOnAlert: (name: string) => {
        cy.get(`[data-test^="health-card-${name}"]`, { timeout: 60000 }).eq(0).should('be.visible').find('button').click()
    },
    verifyAlert: (name: string, mode: string = "alert", alertText?: string) => {
        cy.get(`[data-test^="health-card-${name}"]`, { timeout: 60000 }).eq(0).should('be.visible').find('button').click({ force: true }).then(() => {
            cy.get(networkHealthSelectors.sidePanel).should('be.visible')
            cy.contains(mode).should('exist')
            if (alertText) {
                cy.contains(alertText).should('exist')
            }
            cy.get(`[data-test^="health-card-${name}"]`).eq(0).find('button').click()
            cy.get(networkHealthSelectors.sidePanel).should('not.exist')
        })
    },
    navigateToAlertPage: (name: string) => {
        networkHealth.clickOnAlert(name)
        cy.get(networkHealthSelectors.sidePanel).should('be.visible').then(() => {
            // click the kebab button
            cy.get('div.rule-details-row').first().find('button').click().then(() => {
                cy.contains('Inspect alert').click().then(() => {
                    // "No Alert found" should not show up.
                    cy.byTestID('empty-box').should('not.exist')
                })
            })
        })
    },
    navigateToNetflowTrafficPage: (name: string) => {
        networkHealth.clickOnAlert(name)
        cy.get(networkHealthSelectors.sidePanel).should('be.visible').then(() => {
            // click the kebab button

            cy.get('div.rule-details-row').first().find('button').click().then(() => {
                cy.contains('Inspect network traffic').click().then(() => {

                })
            })
        })
    }
}
