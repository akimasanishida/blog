import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function Login() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] py-12">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
