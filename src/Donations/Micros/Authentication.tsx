import React, { ReactElement } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getAuthenticatedRequest } from "../../Utils/api";
import { QueryParamContext } from "../../Layout/QueryParamContext";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../../../styles/themeContext";
import { Backdrop, Fade, Modal } from "@material-ui/core";
import VerifyEmailIcon from "../../../public/assets/icons/VerifyEmailIcon";
import GmailIcon from "../../../public/assets/icons/GmailIcon";
import OutlookIcon from "../../../public/assets/icons/OutlookIcon";
import AppleMailIcon from "../../../public/assets/icons/AppleMailIcon";

interface Props {}

function Authentication({}: Props): ReactElement {
  const { setContactDetails } = React.useContext(QueryParamContext);
  const {
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    user,
  } = useAuth0();

  const [profile, setprofile] = React.useState<null | Object>(null);
  const [openVerifyEmailModal, setopenVerifyEmailModal] = React.useState(false);

  const loadUserProfile = async () => {
    if (user.email_verified) {
      const token = await getAccessTokenSilently();

      try {
        const profile: any = await getAuthenticatedRequest(
          "/app/profile",
          token
        );
        if (profile.data) {
          setprofile(profile.data);
          const newContactDetails = {
            firstname: profile.data.firstname ? profile.data.firstname : "",
            lastname: profile.data.lastname ? profile.data.lastname : "",
            email: profile.data.email ? profile.data.email : "",
            address: profile.data.address.address
              ? profile.data.address.address
              : "",
            city: profile.data.address.city ? profile.data.address.city : "",
            zipCode: profile.data.address.zipCode
              ? profile.data.address.zipCode
              : "",
            country: profile.data.address.country
              ? profile.data.address.country
              : "",
            companyname: "",
          };
          setContactDetails(newContactDetails);
        }
      } catch (err) {
        // console.log(err);
      }
    } else {
      setopenVerifyEmailModal(true);
    }
  };

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Fetch the profile data
      loadUserProfile();
      // If details present store in contact details
      // If details are not present show message and logout user
    }
  }, [isAuthenticated, isLoading]);

  const { t, ready } = useTranslation("common");
  return (
    <div>
      {!isLoading && !isAuthenticated && (
        <button
          className="login-continue"
          onClick={() =>
            loginWithRedirect({
              redirectUri: `${process.env.NEXTAUTH_URL}`,
              ui_locales: localStorage.getItem("language") || "en",
            })
          }
        >
          {t('loginContinue')}
        </button>
      )}

      {!isLoading && isAuthenticated && (
        <button
          className="login-continue"
          onClick={() => logout({ returnTo: `${process.env.NEXTAUTH_URL}/` })}
        >
          {t('logout')}
        </button>
      )}
      <VerifyEmailModal
        logout={logout}
        openModal={openVerifyEmailModal}
        handleModalClose={() => setopenVerifyEmailModal(false)}
      />
    </div>
  );
}

export default Authentication;

interface VerifyEmailProps {
  openModal: boolean;
  handleModalClose: Function;
  logout: Function;
}

function VerifyEmailModal({
  openModal,
  handleModalClose,
  logout,
}: VerifyEmailProps) {
  const { t, ready } = useTranslation("common");

  const { theme } = React.useContext(ThemeContext);

  return ready ? (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={"modal-container " + theme}
      open={openModal}
      onClose={handleModalClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      disableBackdropClick
    >
      <Fade in={openModal}>
        <div className={"modal p-20"}>
          <p className={"select-language-title mb-20"}>
            {t("verifyEmailHeader")}
          </p>
          <VerifyEmailIcon />
          <p className="text-center mt-30">{t("verifyEmailText")}</p>
          <p className="text-center mt-20">{t("verifyEmailInfo")}</p>
          <div className={"mt-30 d-flex column"}>
            <div
              className={
                "d-flex row w-100 justify-content-center align-items-center mailing-buttons"
              }
            >
              <a
                href="https://mail.google.com/"
                rel="noreferrer"
                target="_blank"
              >
                <GmailIcon />
              </a>
              <a
                href="https://www.icloud.com/mail"
                target="_blank"
                rel="noreferrer"
              >
                <AppleMailIcon />
              </a>
              <a
                href="https://outlook.office.com/mail/"
                target="_blank"
                rel="noreferrer"
              >
                <OutlookIcon />
              </a>
            </div>
            <button
              id={"VerifyEmailModalCan"}
              className={"secondary-button mt-20"}
              style={{ minWidth: "130px" }}
              onClick={() =>
                logout({ returnTo: `${process.env.NEXTAUTH_URL}/` })
              }
            >
              <p>{t("skipLogout")}</p>
            </button>
          </div>
        </div>
      </Fade>
    </Modal>
  ) : null;
}
