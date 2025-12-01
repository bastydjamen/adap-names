import { describe, it, expect } from "vitest";

import { StringName } from "../../../src/adap-b04/names/StringName";
import { IllegalArgumentException } from "../../../src/adap-b04/common/IllegalArgumentException";
import { MethodFailedException } from "../../../src/adap-b04/common/MethodFailedException";

describe("StringName – contract tests", () => {

    it("constructor rejects null source", () => {
        // @ts-ignore
        expect(() => new StringName(null)).toThrow(IllegalArgumentException);
    });

    it("getComponent throws on invalid index", () => {
        const n = new StringName("a.b");
        expect(() => n.getComponent(5)).toThrow(IllegalArgumentException);
    });

    it("setComponent keeps number of components", () => {
        const n = new StringName("a.b");
        const oldCount = n.getNoComponents();
        n.setComponent(0, "x");
        expect(n.getNoComponents()).toBe(oldCount);
    });

    it("insert increases number of components", () => {
        const n = new StringName("a.b");
        const old = n.getNoComponents();
        n.insert(1, "x");
        expect(n.getNoComponents()).toBe(old + 1);
    });

    it("remove decreases number of components", () => {
        const n = new StringName("a.b.c");
        const old = n.getNoComponents();
        n.remove(1);
        expect(n.getNoComponents()).toBe(old - 1);
    });

    it("insert throws for illegal index", () => {
        const n = new StringName("a.b");
        expect(() => n.insert(99, "x")).toThrow(IllegalArgumentException);
    });

    it("append increases number of components", () => {
        const n = new StringName("a.b");
        const old = n.getNoComponents();
        n.append("x");
        expect(n.getNoComponents()).toBe(old + 1);
    });

});
