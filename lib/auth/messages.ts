export const requestFailedError = "কিছু একটা গড়বড় হলো। আবার চেষ্টা করো।";
export const invalidFormError = "তথ্যগুলো একবার দেখে নাও।";
export const emailTakenError =
  "এই ইমেইলে আগেই একটা হিসাব খোলা আছে। সাইন ইন করো।";
export const googleExpiredError = "সময় পেরিয়ে গেছে। আবার গুগল দিয়ে শুরু করো।";

export const loginNotices: Record<string, string> = {
  google: "গুগল দিয়ে ঢোকা গেলো না। আবার চেষ্টা করো।",
  "google-unverified":
    "তোমার গুগল ইমেইলটা যাচাই করা নেই, তাই গুগল দিয়ে ঢোকা যাচ্ছে না।",
  "google-expired": googleExpiredError,
};
