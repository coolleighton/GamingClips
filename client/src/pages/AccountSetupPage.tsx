import { useEffect, useState } from "react";
const Url = import.meta.env.VITE_SERVER_URL;

interface backendData {
  users: string[]; // This means users is an array of strings
}

function AccountSetupPage() {
  const [backendData, setBackendData] = useState<backendData>({ users: [] });

  useEffect(() => {
    fetch(Url + "/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setBackendData(data);
      });
  }, []);

  return (
    <>
      <div>
        <p>hello</p>
        {typeof backendData.users === "undefined" ? (
          <p>Loading...</p>
        ) : (
          backendData.users.map((user, i) => (
            <p className="text-5xl font-black" key={i}>
              {user}
            </p>
          ))
        )}
      </div>
    </>
  );
}

export default AccountSetupPage;
