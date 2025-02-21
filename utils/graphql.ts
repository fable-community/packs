/* eslint-disable @typescript-eslint/no-explicit-any */
type Variables = { [key: string]: any };

export function gql(chunks: TemplateStringsArray, ...variables: any[]): string {
  return chunks.reduce(
    (accumulator, chunk, index) =>
      `${accumulator}${chunk}${index in variables ? variables[index] : ""}`,
    ""
  );
}

export async function request<T = any, V = Variables>({
  url,
  query,
  headers,
  variables,
}: {
  url: string;
  query: string;
  headers?: HeadersInit;
  variables?: V | undefined;
}): Promise<T> {
  const options: {
    method: string;
    headers: Headers;
    body: string;
  } = {
    method: "POST",
    headers: new Headers(headers ?? {}),
    body: JSON.stringify({ query, variables }),
  };

  options.headers.append("Content-Type", "application/json");
  options.headers.append("Accept", "application/json");

  const response = await fetch(url, options);

  const text = await response.text();

  try {
    const json = JSON.parse(text);

    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }

    if (!response.ok) {
      throw new Error(text);
    }

    return json.data;
  } catch (err: Error | any) {
    if (err.message.includes("Not Found")) {
      throw new Error("404");
    }

    throw err;
  }
}
