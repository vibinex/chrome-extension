import { useEffect } from "react";
import { useState } from "react";

const useVersion = (chrome: any) => {
    const [version, setVersion] = useState<string>('');

    useEffect(() => {
        const fetchVersion = () => {
          const manifest = chrome.runtime.getManifest();
          setVersion(manifest.version);
        };
    
        fetchVersion();
    }, [chrome]);

    return version;
};

export default useVersion;