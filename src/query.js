// const query = `
//   query collectorGallery($address: String!) {
//     hic_et_nunc_token_holder(where: {holder_id: {_eq: $address}, quantity: {_gt: "0"}, token: {supply: {_gt: "0"}}}, order_by: {id: desc}) {
//       token {
//         id
//         artifact_uri
//         display_uri
//         thumbnail_uri
//         timestamp
//         mime
//         title
//         description
//         supply
//         token_tags {
//           tag {
//             tag
//           }
//         }
//         creator {
//           address
//         }
//         swaps(where: {status: {_eq: "0"}}, order_by: {price: asc}) {
//           amount
//           amount_left
//           creator_id
//           price
//         }
//       }
//     }
//   }
// `;

const query = `
  query collectorGallery($address: String!) {
    hic_et_nunc_token_holder(where: {holder_id: {_eq: $address}, quantity: {_gt: "0"}, token: {supply: {_gt: "0"}}}, order_by: {id: desc}) {
      token {
        id
        artifact_uri
        mime
        title
      }
    }
  }
`;

export async function fetchGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch("https://api.hicdex.com/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  });

  return await result.json();
}

export function isTezosDomain(address) {
  return /\.tez$/.test(address);
}

export function isValidAddress(address) {
  if (!address) return false;
  return /^(KT|tz)/i.test(address) && /^[0-9a-z]{36}$/i.test(address);
}

export function isValidAddressOrDomain(address) {
  if (!address) return false;
  return isValidAddress(address) || isTezosDomain(address);
}

async function resolveTezosDomain(domain) {
  try {
    const result = await fetch("https://api.tezos.domains/graphql", {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      mode: "cors",
      credentials: "omit",
      body: JSON.stringify({
        query:
          "query resolveDomain($domain: String!) {\n  domain(name: $domain) {\n    address\n  }\n}\n",
        variables: { domain },
        operationName: "resolveDomain",
      }),
    });

    const response = await result.json();
    return response?.data?.domain?.address || "";
  } catch (err) {
    return "";
  }
}

export async function getAddress(addressOrDomain) {
  if (isTezosDomain(addressOrDomain)) {
    const address = await resolveTezosDomain(addressOrDomain.toLowerCase());
    if (address) {
      return address;
    }
  }
  return addressOrDomain;
}

export async function getCollection(address) {
  const { errors, data } = await fetchGraphQL(query, "collectorGallery", {
    address,
  });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token_holder;
  return result;
}
