import { FormControl } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { IbanElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import InfoIcon from "../../../public/assets/icons/InfoIcon";
import themeProperties from "../../../styles/themeProperties";

const SEPA_OPTIONS = {
  supportedCountries: ["SEPA"],
  style: {
    base: {
      fontSize: "14px",
      color: "#424770",
      letterSpacing: "0.025em",
      fontFamily: themeProperties.fontFamily,
      "::placeholder": {
        color: "#aab7c4",
        fontFamily: themeProperties.fontFamily,
      },
    },
    invalid: {
      color: themeProperties.light.dangerColor,
    },
  },
};

const FormControlNew = withStyles({
  root: {
    width: "100%",
    backgroundColor: "#F2F2F7",
    border: "0px!important",
    borderRadius: "10px",
    fontFamily: themeProperties.fontFamily,
    padding: "14px",
  },
})(FormControl);

function SepaPayments({
  paymentType,
  onPaymentFunction,
  contactDetails,
}: any): ReactElement {
  const { t, i18n, ready } = useTranslation("common");
  const stripe = useStripe();
  const elements = useElements();

  const [paymentError, setPaymentError] = React.useState("");
  const [showContinue, setShowContinue] = React.useState(false);

  const validateChange = () => {
    const sepaElement = elements.getElement(IbanElement)!;
    sepaElement.on("change", ({ error }) => {
      if (error) {
        setShowContinue(false);
      } else {
        setShowContinue(true);
      }
    });
  };

  const createPaymentMethodSepa = (sepaElement: any, contactDetails: any) => {
    return stripe?.createPaymentMethod({
      type: "sepa_debit",
      sepa_debit: sepaElement,
      billing_details: {
        name: contactDetails.firstName,
        email: contactDetails.email,
      },
    });
  };
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    setShowContinue(false);
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    let paymentMethod: any;

    if (paymentType === "SEPA") {
      const sepaElement = elements.getElement(IbanElement)!;
      const payload = await createPaymentMethodSepa(
        sepaElement,
        contactDetails
      );
      paymentMethod = payload.paymentMethod;
      // Add payload error if failed
    }
    if (paymentMethod) {
      onPaymentFunction("stripe", paymentMethod);
    } else {
      setPaymentError(t("noPaymentMethodError"));
      return;
    }
  };

  return ready ? (
    <div>
      {paymentError && <div className={paymentError}>{paymentError}</div>}

      <div className={"disclaimer-container"}>
        <InfoIcon />
        <p>{t("sepaDisclaimer")}</p>
      </div>
      <div className="mt-20">
        <FormControlNew variant="outlined">
          <IbanElement
            id="iban"
            options={SEPA_OPTIONS}
            onChange={validateChange}
          />
        </FormControlNew>
      </div>

      {showContinue ? (
          <button
          onClick={handleSubmit}
            className="primary-button w-100 mt-30"
            id="donateContinueButton"
          >
            {t("donate")}
          </button>
      ) : (
          <button
            className="secondary-button w-100 mt-30"
            id="donateContinueButton"
          >
            {t("donate")}
          </button>
      )}

      <div className={"mandate-acceptance"}>{t("sepaMessage")}</div>
    </div>
  ) : (
    <></>
  );
}

export default SepaPayments;