module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "scope-enum": [2, "always", ["frontend", "server", "shared", "deps", "ci"]],
        // Опционально: ограничим scope только известными папками
    },
};
