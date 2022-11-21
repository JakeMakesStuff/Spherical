import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { SetupOption, SetupType } from "./types/oobe";
import fetch from "./helpers/redirectingFetch";
import CallbackManager from "./helpers/CallbackManager";
import Layout from "./conponents/oobe/Layout";
import Loading from "./conponents/shared/Loading";
import SetupBoolean from "./conponents/oobe/inputs/SetupBoolean";
import SetupHostname from "./conponents/oobe/inputs/SetupHostname";
import SetupInput from "./conponents/oobe/inputs/SetupInput";
import SetupTextbox from "./conponents/oobe/inputs/SetupTextbox";

type InstallData = {
    image_url: string;
    image_alt: string;
    title: string;
    description: string;
    step: string;
    options: SetupOption[];
    next_button: string;
};

const validatorCallbacks: CallbackManager<{[key: string]: any}> = new CallbackManager();

const Main = () => {
    // Defines getting/defining the install data.
    const [installData, setInstallData] = useState<InstallData | null | undefined>(undefined);
    useEffect(() => {
        fetch("/install/state").then(async x => {
            if (!x.ok) throw new Error(`Initial GET got status ${x.status}`);
            const j = await x.json();
            setInstallData(j);
        }).catch(() => setInstallData(null));
    }, []);

    // Defines the error message.
    const [errorMessage, setErrorMessage] = useState("");

    // Handle the submit button.
    const submit = () => {
        // Validate the content.
        let values: { [key: string]: any }[];
        try {
            values = validatorCallbacks.runAll();
        } catch (e) {
            setErrorMessage(e.message);
            return;
        }

        // Make a object.
        const o: any = {};
        for (const val of values) {
            for (const key of Object.keys(val)) o[key] = val[key];
        }

        // Make the fetch request.
        fetch("/install/state", {
            method: "POST",
            body: JSON.stringify({
                type: installData.step,
                body: o,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async x => {
            if (x.status === 400) {
                // Set the message to this.
                const j = await x.json();
                setErrorMessage(j.message);
                return;
            }

            if (x.ok) {
                // Set the error message blank.
                setErrorMessage("");
                setInstallData(await x.json());
                return;
            }

            // Throw an error.
            throw new Error(`POST status returned ${x.status}.`);
        }).catch(() => setInstallData(null));
    };

    // If undefined, we should just show loading.
    if (installData === undefined) return <Loading />;

    // If null, return a error.
    if (installData === null) return <Layout> // TODO: i18n

    </Layout>;

    // Map the objects.
    const components = installData.options.map((x, i) => {
        switch (x.type) {
            case SetupType.BOOLEAN:
                return <SetupBoolean
                    key={i} option={x} cbManager={validatorCallbacks}
                />;
            case SetupType.HOSTNAME:
                return <SetupHostname
                    key={i} option={x} cbManager={validatorCallbacks}
                />;
            case SetupType.INPUT:
                return <SetupInput
                    key={i} option={x} cbManager={validatorCallbacks}
                    secret={false}
                />;
            case SetupType.SECRET:
                return <SetupInput
                    key={i} option={x} cbManager={validatorCallbacks}
                    secret={true}
                />;
            case SetupType.TEXTBOX:
                return <SetupTextbox key={i} option={x} cbManager={validatorCallbacks} />;
            default:
                throw new Error("Input type not implemented.");
        }
    });

    // Return the layout.
    return <Layout> // TODO

    </Layout>;
};

render(<Main />, document.getElementById("app_mount"));
