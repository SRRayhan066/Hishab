export const requestFailedError = "কিছু একটা গড়বড় হলো। আবার চেষ্টা করো।";
export const invalidFormError = "তথ্যগুলো একবার দেখে নাও।";
export const emailTakenError =
  "এই ইমেইলে আগেই একটা হিসাব খোলা আছে। সাইন ইন করো।";
export const wrongCredentialsError = "ইমেইল বা পাসওয়ার্ড মিলছে না।";
export const googleExpiredError = "সময় পেরিয়ে গেছে। আবার গুগল দিয়ে শুরু করো।";

export const resetExpiredError =
  "সময় পেরিয়ে গেছে। আবার গোড়া থেকে শুরু করো।";
export const wrongCodeError = "কোডটা মিলছে না। আরেকবার দেখে লেখো।";
export const deadCodeError =
  "এই কোডটা আর কাজ করবে না। নিচে থেকে নতুন কোড চাও।";
export const resendTooSoonError = "একটু অপেক্ষা করো, তারপর নতুন কোড চাও।";

export const loginNotices: Record<string, string> = {
  google: "গুগল দিয়ে ঢোকা গেলো না। আবার চেষ্টা করো।",
  "google-unverified":
    "তোমার গুগল ইমেইলটা যাচাই করা নেই, তাই গুগল দিয়ে ঢোকা যাচ্ছে না।",
  "google-expired": googleExpiredError,
};
