import { describe, it, expect } from "vitest";

import { StringArrayName } from "../../../src/adap-b04/names/StringArrayName";
import { IllegalArgumentException } from "../../../src/adap-b04/common/IllegalArgumentException";

describe("StringArrayName – contract tests", () => {

    it("constructor rejects null array", () => {
        // @ts-ignore
        expect(() => new StringArrayName(null)).toThrow(IllegalArgumentException);
    });

    it("getComponent throws on invalid index", () => {
        const n = new StringArrayName(["a", "b"]);
        expect(() => n.getComponent(5)).toThrow(IllegalArgumentException);
    });

    it("setComponent throws for null component", () => {
        const n = new StringArrayName(["a"]);
        // @ts-ignore
        expect(() => n.setComponent(0, null)).toThrow(IllegalArgumentException);
    });

    it("append increases number of components", () => {
        const n = new StringArrayName(["a"]);
        const old = n.getNoComponents();
        n.append("x");
        expect(n.getNoComponents()).toBe(old + 1);
    });

    it("remove decreases number of components", () => {
        const n = new StringArrayName(["a", "b"]);
        const old = n.getNoComponents();
        n.remove(0);
        expect(n.getNoComponents()).toBe(old - 1);
    });

});
