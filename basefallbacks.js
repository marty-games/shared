   <script>
        // 1. Define the missing variables globally

        var cdns = [
            "https://cdn.jsdelivr.net/gh/",
            "https://fastly.jsdelivr.net/gh/",
            "https://gcore.jsdelivr.net/gh/",
            "https://testingcf.jsdelivr.net/gh/",
            "https://quantil.jsdelivr.net/gh/",
            "https://originfastly.jsdelivr.net/gh/",
            "https://esm.sh/gh/",
            "https://cdn.statically.io/gh/",
            "https://cdn.staticdelivr.com/gh/"
        ];
        var chosenBase = ""; // Starts empty so the loop will trigger

        // 2. Define the missing sleep utility helper
        const sleep = ms => new Promise(res => res, setTimeout(res, ms));

        (async function() {
            // Keep looping until a working CDN is found
            while (!chosenBase) {
                console.log("Starting CDN check cycle...");

                for (const url of cdns) {
                    let timeoutId;
                    try {
                        const controller = new AbortController();
                        timeoutId = setTimeout(() => controller.abort(), 2500);

                        const cacheBuster = Date.now();
                        // NOTE: Make sure this path actually exists on your target CDNs!
                        const response = await fetch(`${url}index.html?v=${cacheBuster}`, {
                            method: 'GET',
                            mode: 'cors',
                            signal: controller.signal
                        });

                        clearTimeout(timeoutId);

                        if (response.ok) {
                            chosenBase = url;
                            break; // Breaks out of the for-loop
                        } else {
                            console.warn(`${url} returned status ${response.status}`);
                        }
                    } catch (e) {
                        if (timeoutId) clearTimeout(timeoutId);
                        console.warn(`${url} failed or timed out, trying next fallback...`, e.message);
                    }
                }

                // If the for-loop finished and we still don't have a winner, wait and try again
                if (!chosenBase) {
                    console.warn("All CDNs failed. Waiting 5 seconds before restarting cycle...");
                    await sleep(5000);
                }
            }

            console.log("Selected CDN:", chosenBase);
        })();
    </script>
 
