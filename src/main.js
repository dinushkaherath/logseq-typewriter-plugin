import "@logseq/libs";
import typewriterSvgContent from "./typewriter.svg";

const typewriterSvgString = typewriterSvgContent.content;

/**
 * user model
 */
const model = {
  togglePluginState(e) {
    console.log(e);
    pluginState.togglePluginState();
  },
};

const pluginState = {
  isPluginEnabled: false,

  togglePluginState() {
    this.isPluginEnabled = !this.isPluginEnabled;
    const message = this.isPluginEnabled ? "Plugin is ON" : "Plugin is OFF";
    logseq.UI.showMsg(message);
  },
};

/**
 * app entry
 */
function main() {
  logseq.setMainUIInlineStyle({
    position: "fixed",
    zIndex: 11,
  });

  const key = logseq.baseInfo.id;

  logseq.provideModel(model);
  logseq.provideStyle(`
    div[data-injected-ui=typewriter-${key}] {
      display: flex;
      align-items: center;
      font-weight: 500;
      position: relative;
    }
  `);

  // external btns
  logseq.App.registerUIItem("toolbar", {
    key: "typewriter",
    template: `
      <a class="button" id="typewriter-button"
      data-on-click="togglePluginState"
      data-rect>
        ${typewriterSvgString}
      </a>
    `,
  });
}

// bootstrap
logseq.ready(main).catch(null);
