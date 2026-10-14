import { db } from "@/lib/db";
import { ReviewsClient } from "./ReviewsClient";
export default async function ReviewsPage() { return <ReviewsClient settings={await db.getSettings()} />; }
