

export function submit(lang, code) {
  return fetch("http://localhost:5175/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      format: lang,
      code: code,
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
      return { error: "Submission failed" };
    });
}


export function run(lang, code) {
  return fetch("http://localhost:5175/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language: lang,
      code: code,
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
      return { error: "Execution failed" };
    });
}
