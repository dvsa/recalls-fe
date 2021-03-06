package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import uk.gov.dvsa.recalls.helper.FormDataHelper;
import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;
import uk.gov.dvsa.recalls.ui.base.PageInstanceNotFoundException;

public abstract class SelectModelPage extends Page {

    private WebDriverWait wait = new WebDriverWait(driver, 5);
    @FindBy(id = "continue-button") private WebElement continueButton;
    @FindBy(id = "model") WebElement vehicleModelDropdown;
    @FindBy(className = "error-message") private WebElement errorMessage;
    @FindBy(className = "link-back") private WebElement backButton;
    @FindBy(id = "recall-not-listed-link") private WebElement recallNotListedLink;

    @Override
    protected abstract String getExpectedPageTitle();

    public abstract Page selectModelAndContinue(String model);

    void selectModelAndContinueCommon(String model) {
        FormDataHelper.selectFromDropDownByVisibleText(vehicleModelDropdown, model);
        clickContinueButtonWhenReady();
    }

    void clickContinueButtonWhenReady() {
        title.click(); // Click some text to close a dropdown which might be obscuring the button
        wait.until(ExpectedConditions.elementToBeClickable(continueButton)).click();
    }

    public void clickContiniueWithNoOptionsSelected() {
        FormDataHelper.selectFromDropDownByVisibleText(vehicleModelDropdown, "Choose a model");
        continueButton.click();
    }

    public boolean formErrorMessageIsVisible() {
        return errorMessage.getText().contains("Select the vehicle model");
    }

    public SelectMakePage clickBackButton(Class<? extends SelectMakePage> clazz) {
        backButton.click();
        try {
            return clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            throw new PageInstanceNotFoundException(String.format("Could not create a Make Page: %s", clazz.getName()));
        }
    }

    public RecallNotListedPage clickWhyModelIsNotListedLink() {
        recallNotListedLink.click();
        return new RecallNotListedPage();
    }
}
