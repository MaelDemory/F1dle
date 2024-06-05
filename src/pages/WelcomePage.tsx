import {TestButton} from "../components";
import {Logo} from "../components/Logo";

export const WelcomePage = () => {
    return (
        <div className="bg-slate-950 text-white min-h-screen max-w-full font-sans flex flex-col items-center">
            <div className="w-full flex justify-center mt-10 mb-10">
                <Logo/>
            </div>
            <div className="content-center">
                <TestButton/>
            </div>
        </div>
    )
}