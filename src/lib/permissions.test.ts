import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isEditorial,
  canPublish,
  canDeleteContent,
  canManageTeam,
  canModerate,
  canCreateStory,
} from "./permissions";

describe("role permissions", () => {
  it("does not grant editorial access to public accounts", () => {
    assert.equal(isEditorial("PUBLIC"), false);
    assert.equal(canCreateStory("PUBLIC"), false);
    assert.equal(canPublish("PUBLIC"), false);
    assert.equal(canModerate("PUBLIC"), false);
    assert.equal(canDeleteContent("PUBLIC"), false);
    assert.equal(canManageTeam("PUBLIC"), false);
  });

  it("does not treat missing roles as editorial", () => {
    assert.equal(isEditorial(undefined), false);
    assert.equal(isEditorial(null), false);
    assert.equal(canPublish(undefined), false);
  });

  it("lets editors write, publish, and moderate without managing the team", () => {
    assert.equal(isEditorial("EDITOR"), true);
    assert.equal(canCreateStory("EDITOR"), true);
    assert.equal(canPublish("EDITOR"), true);
    assert.equal(canModerate("EDITOR"), true);
    assert.equal(canDeleteContent("EDITOR"), false);
    assert.equal(canManageTeam("EDITOR"), false);
  });

  it("gives admins full control", () => {
    assert.equal(isEditorial("ADMIN"), true);
    assert.equal(canDeleteContent("ADMIN"), true);
    assert.equal(canManageTeam("ADMIN"), true);
    assert.equal(canPublish("ADMIN"), true);
  });
});
