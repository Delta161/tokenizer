/**
 * KYC status enum
 */
export var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "PENDING";
    KycStatus["VERIFIED"] = "VERIFIED";
    KycStatus["REJECTED"] = "REJECTED";
})(KycStatus || (KycStatus = {}));
/**
 * KYC provider enum
 */
export var KycProvider;
(function (KycProvider) {
    KycProvider["SUMSUB"] = "sumsub";
    KycProvider["ONFIDO"] = "onfido";
    KycProvider["VERIFF"] = "veriff";
})(KycProvider || (KycProvider = {}));
//# sourceMappingURL=kyc.types.js.map