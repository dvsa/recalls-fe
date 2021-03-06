package uk.gov.dvsa.recalls.ui.base;

import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import uk.gov.dvsa.recalls.WebDriverConfiguratorRegistry;
import uk.gov.dvsa.recalls.config.webdriver.BaseAppDriver;
import uk.gov.dvsa.recalls.elements.DvsaElementLocatorFactory;
import uk.gov.dvsa.recalls.elements.DvsaWebElement;
import uk.gov.dvsa.recalls.elements.FindElementLocator;

public abstract class Page {

    protected BaseAppDriver driver;

    @FindBy(tagName = "h1")
    protected WebElement title;

    @FindBy(id = "cookies-link")
    protected WebElement cookiesLink;

    @FindBy(id = "terms-and-conditions-link")
    protected WebElement termsAndConditionsLink;

    @FindBy(id = "phase-banner")
    protected WebElement phaseBanner;

    public Page() {

        this.driver = WebDriverConfiguratorRegistry.get().getDriver();
        DvsaElementLocatorFactory factory = new DvsaElementLocatorFactory(driver);
        PageFactory.initElements(factory, this);
        selfVerify();
    }

    public String getTitle() {

        return title.getText();
    }

    protected void selfVerify() {

        if (!getTitle().contains(getExpectedPageTitle())) {

            throw new PageIdentityVerificationException("Page identity verification failed: " +
                    String.format("\n Expected: %s page, \n Found: %s page",
                            getExpectedPageTitle(), getTitle())
            );
        }

        if (!phaseBanner.isDisplayed()) {
            throw new PagePhaseBannerVerificationException("Page verification failed: " +
                    String.format("\n Page %s expected to have a phase banner",
                            getTitle())
            );
        }
    }

    protected abstract String getExpectedPageTitle();

    @Override
    public final String toString() {

        return "Page: " + getTitle();
    }


    protected String getElementText(By selector) {

        try {
            return driver.findElement(selector).getText();
        } catch (StaleElementReferenceException ex) {
            return getElementText(selector);
        }
    }

    protected Boolean isElementVisible(By selector) {

        try {
            return driver.findElement(selector).isDisplayed();
        } catch (StaleElementReferenceException ex) {
            return isElementVisible(selector);
        }
    }

    protected void clickElement(By selector) {

        try {
            driver.findElement(selector).click();
        } catch (StaleElementReferenceException ex) {
            clickElement(selector);
        }
    }

    protected WebElement getElement(By selector) {

        try {
            return DvsaWebElement.wrap(driver.findElement(selector), new FindElementLocator(driver, selector));
        } catch (StaleElementReferenceException ex) {
            return getElement(selector);
        }
    }

    protected String getLinkHref(By selector) {

        try {
            return driver.findElement(selector).getAttribute("href");
        } catch (StaleElementReferenceException ex) {
            return getLinkHref(selector);
        }
    }
}
