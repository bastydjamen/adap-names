import { describe, it, expect } from "vitest";

import { File } from "../../../src/adap-b04/files/File";
import { RootNode } from "../../../src/adap-b04/files/RootNode";
import { IllegalArgumentException } from "../../../src/adap-b04/common/IllegalArgumentException";

describe("File – contract tests", () => {

    // Use the real RootNode as parent directory
    const root: RootNode = RootNode.getRootNode();

    it("open only allowed when CLOSED", () => {
        const f = new File("x", root);
        f.open(); // first open is fine
        expect(() => f.open()).toThrow(IllegalArgumentException);
    });

    it("read only allowed when OPEN", () => {
        const f = new File("x", root);
        // file is still CLOSED, so read should fail
        expect(() => f.read(1)).toThrow(IllegalArgumentException);
    });

    it("read rejects negative bytes", () => {
        const f = new File("x", root);
        f.open();
        expect(() => f.read(-5)).toThrow(IllegalArgumentException);
    });

    it("close only allowed when OPEN", () => {
        const f = new File("x", root);
        // currently CLOSED, so close should fail
        expect(() => f.close()).toThrow(IllegalArgumentException);
    });

});
