import { useEffect, useState } from "react";

const BLOCKLIST_API =
    "/api/BlockedNumbers";

const SETTINGS_API =
    "/api/Settings";

function App() {
    const [page, setPage] =
        useState("blocklist");

    const [items, setItems] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [number, setNumber] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [errorMessage,
        setErrorMessage] =
        useState("");

    const [successMessage,
        setSuccessMessage] =
        useState("");

    const [settingsLoading,
        setSettingsLoading] =
        useState(false);

    const [settings,
        setSettings] =
        useState({
            tenantId: "",
            applicationId: "",
            certificateThumbprint: "",
        });

    useEffect(() => {
        loadNumbers();
    }, []);

    async function loadNumbers() {
        setLoading(true);
        setErrorMessage("");

        try {
            const response =
                await fetch(
                    BLOCKLIST_API
                );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            setItems(data);
        } catch (error) {
            setErrorMessage(
                "Unable to load block list."
            );
        } finally {
            setLoading(false);
        }
    }

    async function addNumber() {
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response =
                await fetch(
                    BLOCKLIST_API,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            number,
                            description,
                        }),
                    }
                );

            if (!response.ok) {
                throw new Error();
            }

            setNumber("");
            setDescription("");

            await loadNumbers();

            setSuccessMessage(
                "Number added successfully."
            );
        } catch {
            setErrorMessage(
                "Unable to add number."
            );
        }
    }

    async function deleteNumber(
        identity
    ) {
        if (
            !window.confirm(
                `Delete ${identity}?`
            )
        ) {
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response =
                await fetch(
                    `${BLOCKLIST_API}/${identity}`,
                    {
                        method: "DELETE",
                    }
                );

            if (!response.ok) {
                throw new Error();
            }

            await loadNumbers();

            setSuccessMessage(
                "Number deleted successfully."
            );
        } catch {
            setErrorMessage(
                "Unable to delete number."
            );
        }
    }

    async function loadSettings() {
        setSettingsLoading(true);
        setErrorMessage("");

        try {
            const response =
                await fetch(
                    SETTINGS_API
                );

            if (!response.ok) {
                throw new Error();
            }

            const data =
                await response.json();

            setSettings(data);
        } catch {
            setErrorMessage(
                "Unable to load settings."
            );
        } finally {
            setSettingsLoading(false);
        }
    }

    async function saveSettings() {
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response =
                await fetch(
                    SETTINGS_API,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(
                            settings
                        ),
                    }
                );

            if (!response.ok) {
                throw new Error();
            }

            setSuccessMessage(
                "Settings saved successfully."
            );
        } catch {
            setErrorMessage(
                "Unable to save settings."
            );
        }
    }
	async function testConnection() {
    setErrorMessage("");
    setSuccessMessage("");

    try {
        const response =
            await fetch(
                "/api/settings/test",
                {
                    method: "POST",
                }
            );

        if (!response.ok) {
            const error =
                await response.text();

            throw new Error(
                error
            );
        }

        setSuccessMessage(
            "Teams connection test successful."
        );
    }
    catch (error) {
        setErrorMessage(
            "Teams connection test failed. " +
            error.message
        );
    }
}

    const filteredItems =
        items.filter((item) =>
            (
                item.identity +
                " " +
                (item.description ||
                    "")
            )
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor:
                "#0f172a",
            color: "white",
            fontFamily:
                "Segoe UI",
            padding: "30px",
        },

        container: {
            maxWidth: "1400px",
            margin: "0 auto",
        },

        card: {
            backgroundColor:
                "#1e293b",
            borderRadius:
                "12px",
            padding: "20px",
            marginBottom:
                "20px",
        },

        input: {
            width: "100%",
            padding: "12px",
            marginTop: "6px",
            backgroundColor:
                "#0f172a",
            border:
                "1px solid #334155",
            color: "white",
            borderRadius:
                "8px",
            boxSizing:
                "border-box",
        },

        button: {
            padding:
                "12px 20px",
            backgroundColor:
                "#2563eb",
            color: "white",
            border: "none",
            borderRadius:
                "8px",
            cursor:
                "pointer",
        },

        secondaryButton: {
            padding:
                "10px 16px",
            backgroundColor:
                "#334155",
            color: "white",
            border: "none",
            borderRadius:
                "8px",
            cursor:
                "pointer",
        },
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1>
                    Teams Block Manager
                </h1>

                <p>
                    Manage the tenant-wide
                    Microsoft Teams
                    inbound call block
                    list.
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom:
                            "20px",
                    }}
                >
                    <button
                        style={
                            styles.secondaryButton
                        }
                        onClick={() =>
                            setPage(
                                "blocklist"
                            )
                        }
                    >
                        Block List
                    </button>

                    <button
                        style={
                            styles.secondaryButton
                        }
                        onClick={() => {
                            setPage(
                                "settings"
                            );

                            loadSettings();
                        }}
                    >
                        Settings
                    </button>
                </div>

                {errorMessage && (
                    <div
                        style={{
                            background:
                                "#7f1d1d",
                            padding:
                                "12px",
                            marginBottom:
                                "15px",
                            borderRadius:
                                "8px",
                        }}
                    >
                        Error:{" "}
                        {
                            errorMessage
                        }
                    </div>
                )}

                {successMessage && (
                    <div
                        style={{
                            background:
                                "#166534",
                            padding:
                                "12px",
                            marginBottom:
                                "15px",
                            borderRadius:
                                "8px",
                        }}
                    >
                        {
                            successMessage
                        }
                    </div>
                )}

                {page ===
                "settings" ? (
                    <div
                        style={
                            styles.card
                        }
                    >
                        <h2>
                            Teams
                            Authentication
                            Settings
                        </h2>
						<div
    style={{
        background:
            "#78350f",
        border:
            "1px solid #f59e0b",
        color:
            "#fcd34d",
        padding:
            "15px",
        borderRadius:
            "8px",
        marginBottom:
            "20px",
        lineHeight:
            "1.6",
    }}
>
    <strong>
        ⚠ Warning
    </strong>

    <div
        style={{
            marginTop:
                "8px",
        }}
    >
        Make no changes to this
        page unless you know
        exactly what you are
        doing.

        Incorrect values may
        prevent the application
        from connecting to
        Microsoft Teams and stop
        the block list from
        functioning.
    </div>
</div>

                        {settingsLoading ? (
                            <p>
                                Loading
                                settings...
                            </p>
                        ) : (
                            <>
                                <div
                                    style={{
                                        marginBottom:
                                            "20px",
                                    }}
                                >
                                    <label>
                                        Tenant
                                        ID
                                    </label>

                                    <input
                                        style={
                                            styles.input
                                        }
                                        value={
                                            settings.tenantId
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSettings(
                                                {
                                                    ...settings,
                                                    tenantId:
                                                        e
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    />
                                </div>

                                <div
                                    style={{
                                        marginBottom:
                                            "20px",
                                    }}
                                >
                                    <label>
                                        Application
                                        ID
                                    </label>

                                    <input
                                        style={
                                            styles.input
                                        }
                                        value={
                                            settings.applicationId
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSettings(
                                                {
                                                    ...settings,
                                                    applicationId:
                                                        e
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    />
                                </div>

                                <div
                                    style={{
                                        marginBottom:
                                            "20px",
                                    }}
                                >
                                    <label>
                                        Certificate
                                        Thumbprint
                                    </label>

                                    <input
                                        style={
                                            styles.input
                                        }
                                        value={
                                            settings.certificateThumbprint
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSettings(
                                                {
                                                    ...settings,
                                                    certificateThumbprint:
                                                        e
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    />
                                </div>

<div
    style={{
        display:
            "flex",
        gap:
            "10px",
    }}
>
    <button
        style={
            styles.button
        }
        onClick={
            saveSettings
        }
    >
        Save Settings
    </button>

    <button
        style={
            styles.secondaryButton
        }
        onClick={
            testConnection
        }
    >
        Test Connection
    </button>
</div>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div
                            style={
                                styles.card
                            }
                        >
                            <h2>
                                Add Number
                            </h2>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "10px",
                                }}
                            >
                                <input
                                    style={
                                        styles.input
                                    }
                                    placeholder="+441234567890"
                                    value={
                                        number
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setNumber(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                />

                                <input
                                    style={
                                        styles.input
                                    }
                                    placeholder="Description"
                                    value={
                                        description
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setDescription(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                />

                                <button
                                    style={
                                        styles.button
                                    }
                                    onClick={
                                        addNumber
                                    }
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div
                            style={
                                styles.card
                            }
                        >
                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    marginBottom:
                                        "15px",
                                }}
                            >
                                <input
                                    style={{
                                        ...styles.input,
                                        maxWidth:
                                            "400px",
                                    }}
                                    placeholder="Search..."
                                    value={
                                        search
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSearch(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                />

                                <button
                                    style={
                                        styles.secondaryButton
                                    }
                                    onClick={
                                        loadNumbers
                                    }
                                >
                                    Refresh
                                </button>
                            </div>

                            {loading ? (
                                <p>
                                    Loading...
                                </p>
                            ) : (
                                <table
                                    style={{
                                        width:
                                            "100%",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th>
                                                Number
                                            </th>
                                            <th>
                                                Description
                                            </th>
                                            <th>
                                                Status
                                            </th>
                                            <th>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredItems.map(
                                            (
                                                item
                                            ) => (
                                                <tr
                                                    key={
                                                        item.identity
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            item.identity
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.description
                                                        }
                                                    </td>

                                                    <td>
                                                        {item.enabled
                                                            ? "Enabled"
                                                            : "Disabled"}
                                                    </td>

                                                    <td>
                                                        <button
                                                            style={{
                                                                background:
                                                                    "#dc2626",
                                                                color:
                                                                    "white",
                                                                border:
                                                                    "none",
                                                                padding:
                                                                    "6px 12px",
                                                                borderRadius:
                                                                    "6px",
                                                            }}
                                                            onClick={() =>
                                                                deleteNumber(
                                                                    item.identity
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;