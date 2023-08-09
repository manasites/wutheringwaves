import customConfig from "~/_custom/config.json";
import type { Site } from "~/db/payload-types";

export const siteHomeShouldReload = ({
   currentSite,
   site,
}: {
   currentSite?: any;
   site?: Site;
}) => {
   // Don't use csr if any are true
   // This will only return true if user is on a core site
   // and navigates to another core site
   if (
      currentSite?.type == "custom" ||
      site?.type == "custom" ||
      site?.domain ||
      customConfig?.domain != ""
   )
      return true;
};

export const siteHomePath = ({
   site,
   isMobileApp,
}: {
   site: Site;
   isMobileApp?: Boolean;
}) =>
   //On the mobile app, we are ok serving all sites through
   `${
      site?.domain && !isMobileApp ? `https://${site?.domain}` : `/${site.slug}`
   }`;

export const siteHomeRoot = ({ site }: { site: Site }) =>
   `${site?.domain ? `/` : `/${site.slug}`}`;
