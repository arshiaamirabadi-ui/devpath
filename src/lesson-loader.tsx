import { tx } from "./locale";
import { lazy, Suspense } from "react";
const Content = lazy(() => import("./LessonContent"));
export default function LessonContent(props: {
  activityId: string;
  compact?: boolean;
}) {
  return <Suspense fallback={<div className="content-loading" role="status"><span />{tx("در حال آماده‌کردن راهنمای درس…")}</div>}><Content {...props} /></Suspense>;
}
