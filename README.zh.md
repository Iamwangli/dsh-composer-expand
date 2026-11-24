# dsh-composer-expand

[English](README.md) | 中文

在 DeepSeek Harness（`dsh`）Web 的输入框 **发送** 按钮旁增加一个小的切换按钮。

- 点击按钮可 **放大输入框**（提高草稿区的最大高度上限，并设置最小高度，所以空输入框也会变大）。
- 放大状态下，按 **Enter 是换行**，不再发送；发送请用 **发送** 按钮或 **Ctrl/Cmd+Enter**。
- 再点一次，恢复原来的高度和默认的 **Enter 发送**。
- **Shift+Enter** 仍然换行，中文输入法（IME）选词不受影响。

## 安装

从 GitHub 安装（未发布 npm）：

```sh
dsh plugin --profile web add git+https://github.com/Iamwangli/dsh-composer-expand.git
```

从本地目录安装：

```sh
dsh plugin --profile web add /path/to/dsh-composer-expand
```

安装后重启 `web` profile（或刷新页面）。

## 用法

按钮位于输入框工具栏、发送按钮旁。提示文字会跟随界面语言（中文「放大输入框 / 收起输入框」，英文 "Enlarge input / Restore input"）。

## 调整高度

`client.js` 顶部的两个常量控制放大后的尺寸：

```js
const EXPANDED_MIN_HEIGHT = '320px'; // 空输入框时的高度下限
const EXPANDED_MAX_HEIGHT = '560px'; // 长文本可长到的上限
```

## 兼容性

在 DSH `0.2.2-rc.5` 上开发和测试。只使用公开的 `conversation.input.right` 槽位、客户端 locale 服务，以及输入框已文档化的 `data-composer-card` / `data-input-scroll` / `data-composer-input` 钩子。

## 许可证

MIT —— 见 [LICENSE](LICENSE)。
