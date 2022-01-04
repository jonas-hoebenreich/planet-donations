import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { QueryParamContext } from "../../../Layout/QueryParamContext";
import themeProperties from "../../../../styles/themeProperties";
import getFormatedCurrency, {
  getFormatedCurrencySymbol,
} from "../../../Utils/getFormattedCurrency";
import DownArrowIcon from "../../../../public/assets/icons/DownArrowIcon";
import TreeCostLoader from "../../../Common/ContentLoaders/TreeCostLoader";
import LeafIcon from "../../../../public/assets/icons/LeafIcon";
import PlantPotIcon from "../../../../public/assets/icons/PlantPotIcon";
import TreeIcon from "../../../../public/assets/icons/TreeIcon";
import TwoLeafIcon from "../../../../public/assets/icons/TwoLeafIcon";
import CustomIcon from "../../../../public/assets/icons/CustomIcon";
import { useRouter } from "next/router";

interface Props {
  setopenCurrencyModal: any;
}

function FundingDonations({ setopenCurrencyModal }: Props): ReactElement {
  const { t, i18n } = useTranslation(["common", "country"]);

  const [customInputValue, setCustomInputValue] = React.useState("");

  const [isCustomDonation, setisCustomDonation] = React.useState(false);
  // const AllIcons = [
  //   <LeafIcon />,
  //   <TwoLeafIcon />,
  //   <PlantPotIcon />,
  //   <TreeIcon />,
  // ];
  const { paymentSetup, currency, quantity, setquantity, isGift, giftDetails } =
    React.useContext(QueryParamContext);
  // React.useEffect(() => {
  //   if (paymentSetup?.options) {
  //     setquantity(paymentSetup.options[1].quantity);
  //   }
  // for (let i = 0; i < paymentSetup?.options?.length; i++) {
  //   if (paymentSetup.options[i].isDefault) {
  //     setquantity(paymentSetup.options[i].quantity);
  //   }
  // }
  // }, [paymentSetup]);
  const router = useRouter();

  const setCustomValue = (e: any) => {
    if (e.target) {
      // setquantity(e.target.value);
      if (e.target.value === "" || e.target.value < 1) {
        // if input is '', default 1
        setquantity(paymentSetup.unitBased ? 1 / paymentSetup.unitCost : 1);
      } else if (e.target.value.toString().length <= 12) {
        setquantity(
          paymentSetup.unitBased
            ? e.target.value / paymentSetup.unitCost
            : e.target.value
        );
      }
    }
  };

  useEffect(() => {
    if (isCustomDonation) {
      customInputRef?.current?.focus();
    }
  }, [isCustomDonation]);

  const customInputRef = React.useRef(null);

  React.useEffect(() => {
    if (paymentSetup && paymentSetup.options) {
      // Set all quantities in the allOptionsArray
      const newallOptionsArray = [];
      for (const option of paymentSetup.options) {
        newallOptionsArray.push(option.quantity);
      }
      const defaultPaymentOption = paymentSetup.options.filter(
        (option) => option.isDefault === true
      );
      const newQuantity = router.query.units
        ? Number(router.query.units)
        : defaultPaymentOption.length > 0
        ? defaultPaymentOption[0].quantity
        : paymentSetup.options[1].quantity;
      setquantity(newQuantity);

      if (newQuantity && !newallOptionsArray.includes(newQuantity)) {
        setCustomInputValue(
          paymentSetup.unitBased
            ? newQuantity * paymentSetup.unitCost
            : newQuantity
        );
        setisCustomDonation(true);
      } else if (newQuantity == 0) {
        setisCustomDonation(true);
      } else {
        setCustomInputValue("");
        setisCustomDonation(false);
      }
    }
  }, [paymentSetup]);

  // IMP TO DO -> Due to new requirements of showing Rounded costs for Bouquet and in future for all we will now have to start passing the amount instead of quantity and unitCost, this demands a structural change in multiple files and hence should be done carefully

  // const roundedCostCalculator=(unitCost,quantity)=>{
  //   console.log(`unitCost,quantity`, unitCost,quantity)
  //   const cost = unitCost  * quantity;
  //   return Math.trunc(Math.ceil(cost/5)*5);
  // }

  return (
    <>
      <div
        className={`funding-selection-options-container ${
          isGift && giftDetails.recipientName === "" ? "display-none" : ""
        }`}
      >
        {paymentSetup.options &&
          paymentSetup.options.slice(0, 6).map((option, index) => {
            return (
              <div
                key={index}
                onClick={() => {
                  setquantity(option.quantity);
                  setisCustomDonation(false);
                  setCustomInputValue("");
                }}
                className={`funding-selection-option ${
                  option.quantity === quantity && !isCustomDonation
                    ? "funding-selection-option-selected"
                    : ""
                }`}
                style={{ maxWidth: "100px" }}
              >
                {/* <div
                  className={"funding-icon"}
                  style={{ height: "auto", width: "auto" }}
                >
                  {AllIcons[index]}
                </div> */}
                <div className="funding-selection-option-text">
                  <span style={{ fontSize: "18px" }}>
                    {getFormatedCurrency(i18n.language, "", option.quantity)}
                  </span>
                </div>
              </div>
            );
          })}

        {paymentSetup && paymentSetup.options && (
          <div
            className={`funding-selection-option custom ${
              isCustomDonation ? "funding-selection-option-selected" : ""
            }`}
            onClick={() => {
              setisCustomDonation(true);
              customInputRef?.current?.focus();
            }}
            style={{ flexGrow: 1 }}
          >
            {/* <div
              className={"funding-icon"}
              style={{ height: "auto", width: "auto" }}
            >
              <CustomIcon />
            </div> */}

            {isCustomDonation ? (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p
                  style={{
                    fontSize: "18px",
                    marginTop: "3px",
                  }}
                >
                  {getFormatedCurrencySymbol(currency)}
                </p>
                <input
                  className={"funding-custom-tree-input"}
                  style={{ fontSize: "18px" }}
                  onInput={(e) => {
                    // replaces any character other than number to blank
                    // e.target.value = e.target.value.replace(/[,]/g, '.');
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    //  if length of input more than 12, display only 12 digits
                    if (e.target.value.toString().length >= 12) {
                      e.target.value = e.target.value.toString().slice(0, 12);
                    }
                  }}
                  value={customInputValue}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  onChange={(e) => {
                    setCustomValue(e);
                    setCustomInputValue(e.target.value);
                  }}
                  ref={customInputRef}
                />
              </div>
            ) : (
              <div
                className="funding-selection-option-text"
                style={{ fontSize: "18px" }}
              >
                <p style={{ margin: "5px" }}> {t("custom")}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {paymentSetup && paymentSetup.unitCost ? (
        <p className="currency-selection mt-30">
          <button
            onClick={() => {
              setopenCurrencyModal(true);
            }}
            className="text-bold text-primary"
            style={{ marginRight: "4px" }}
            data-test-id="currency"
          >
            <span style={{ marginRight: "4px" }} className={"text-normal"}>
              {t("selectCurrency")}
            </span>
            {currency} <DownArrowIcon color={themeProperties.primaryColor} />
          </button>
        </p>
      ) : (
        <div className={"mt-20"}>
          <TreeCostLoader width={150} />
        </div>
      )}
    </>
  );
}

export default FundingDonations;
