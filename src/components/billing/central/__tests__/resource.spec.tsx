import { act, renderHook, waitFor } from "@testing-library/react";
import useCentralResource from "../useCentralResource";
import { BillingApiError } from "@/lib/api/billing";
it("ignora resposta antiga mesmo após retorno A-B-A e limpa ao perder permissão", async () => {
  const pending:Array<{ resolve:(v:string)=>void;reject:(e:unknown)=>void }>=[];
  const load=jest.fn(()=>new Promise<string>((resolve,reject)=>pending.push({resolve,reject})));
  const {result,rerender}=renderHook(({scope,revision})=>useCentralResource(scope,load,revision),{initialProps:{scope:"a:1",revision:0}});
  rerender({scope:"b:2",revision:0});
  rerender({scope:"a:3",revision:0});
  await act(async()=>pending[0].resolve("segredo antigo"));
  expect(result.current.data).toBeNull();
  await act(async()=>pending[2].resolve("grupo atual"));
  expect(result.current.data).toBe("grupo atual");
  rerender({scope:"a:3",revision:1});
  expect(result.current.data).toBe("grupo atual");
  await act(async()=>pending[3].reject(new BillingApiError("Proibido",403,{})));
  await waitFor(()=>expect(result.current.data).toBeNull());
  expect(result.current.status).toBe(403);
});
