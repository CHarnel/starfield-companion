const { withGradleProperties } = require("expo/config-plugins");

const JVM_ARGS =
  "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8";

module.exports = function withGradleJvmArgs(config) {
  return withGradleProperties(config, (cfg) => {
    cfg.modResults = cfg.modResults.filter(
      (item) =>
        !(item.type === "property" && item.key === "org.gradle.jvmargs")
    );
    cfg.modResults.push({
      type: "property",
      key: "org.gradle.jvmargs",
      value: JVM_ARGS,
    });
    return cfg;
  });
};
