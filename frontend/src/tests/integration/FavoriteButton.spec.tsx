// frontend/src/tests/integration/FavoriteButton.spec.tsx
import React, { ComponentType } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

/* -----------------------------------------------------------
 * 共通：FavoriteButton の export 形態に依存しないローダ
 * ----------------------------------------------------------- */
interface FavoriteButtonProps {
  shelterId: string;
}

function isReactComponent<P = unknown>(x: unknown): x is ComponentType<P> {
  if (typeof x === "function") return true;
  if (x && typeof x === "object") {
    const obj = x as Record<string, unknown>;
    if ("$$typeof" in obj) return true; // memo/forwardRef
    if ("render" in obj && typeof obj.render === "function") return true; // forwardRef
    if ("type" in obj && typeof obj.type === "function") return true; // memo(type)
  }
  return false;
}

function pickFavoriteButton(
  mod: Record<string, unknown>
): ComponentType<FavoriteButtonProps> {
  const preferred = ["default", "FavoriteButton", "Component", "Btn"];
  for (const key of preferred) {
    if (key in mod && isReactComponent<FavoriteButtonProps>(mod[key])) {
      return mod[key] as ComponentType<FavoriteButtonProps>;
    }
  }
  for (const cand of Object.values(mod)) {
    if (isReactComponent<FavoriteButtonProps>(cand)) {
      return cand as ComponentType<FavoriteButtonProps>;
    }
  }
  // ここで止まったら、エクスポート名を見直してください
  // console.error("[FavoriteButton.spec] exports keys:", Object.keys(mod));
  throw new Error("FavoriteButton component not found in module exports.");
}

/* -----------------------------------------------------------
 * 共通：画面上の「押せる要素」を柔軟に見つけるヘルパ
 * ----------------------------------------------------------- */
function findClickableOptional(): HTMLElement | null {
  // 強い識別子
  const byTestId =
    screen.queryByTestId("favorite-button") ??
    screen.queryByTestId("fav-btn") ??
    null;
  if (byTestId) return byTestId as HTMLElement;

  // アクセシブルネーム
  const name = /お気に入り|favorite|fav|ハート|heart/i;
  const byRoleNamedButton = screen.queryByRole("button", { name });
  if (byRoleNamedButton) return byRoleNamedButton;

  const byRoleNamedLink = screen.queryByRole("link", { name });
  if (byRoleNamedLink) return byRoleNamedLink;

  // aria-label / title
  const labelSel =
    `[aria-label*="お気に入り" i], [title*="お気に入り" i],` +
    `[aria-label*="favorite" i], [title*="favorite" i],` +
    `[aria-label*="fav" i], [title*="fav" i],` +
    `[aria-label*="heart" i], [title*="heart" i]`;
  const byLabel = document.body.querySelector(labelSel);
  if (byLabel) return byLabel as HTMLElement;

  // 最初の button / link
  const buttons = screen.queryAllByRole("button");
  if (buttons.length > 0) return buttons[0];
  const links = screen.queryAllByRole("link");
  if (links.length > 0) return links[0];

  // 最後の手段：クリックできそうな候補
  const candidates = Array.from(
    document.body.querySelectorAll<HTMLElement>(
      '[role="button"], [tabindex], button, a, [onclick]'
    )
  ).filter((el) => !el.hasAttribute("disabled"));
  return candidates[0] ?? null;
}

/* -----------------------------------------------------------
 * シナリオ別モック + 動的 import ローダ
 *   - loggedIn: ログイン状態
 *   - isFav: 初期 isFavorite か
 * 戻り値に spy を含めるので、検証に使えます
 * ----------------------------------------------------------- */
async function loadFavoriteButtonWithMocks(opts: {
  loggedIn: boolean;
  isFav?: boolean;
}) {
  const { loggedIn, isFav = false } = opts;

  // ルーターは共通 spy
  const push = vi.fn();
  const replace = vi.fn();
  const prefetch = vi.fn();

  // useFavorites 操作用の spy
  const addFavorite = vi.fn(async (_: string) => {});
  const removeFavorite = vi.fn(async (_: string) => {});

  vi.resetModules();

  // Firebase クライアント（実初期化阻止）
  vi.doMock("@/lib/firebaseClient", () => ({
    auth: { currentUser: null },
    googleProvider: {},
  }));

  // Next.js Router
  vi.doMock("next/navigation", async () => {
    const actual = await vi.importActual<typeof import("next/navigation")>(
      "next/navigation"
    );
    return {
      ...actual,
      useRouter: () => ({ push, replace, prefetch }),
    };
  });

  // 認証（ログイン可変）
  vi.doMock("@/features/auth/AuthProvider", () => ({
    useAuth: () => ({
      user: loggedIn ? { uid: "u-1", email: "u@example.com" } : null,
      loading: false,
      initialized: true,
    }),
  }));

  // useFavorites（初期 isFavorite を可変に）
  vi.doMock("@/hooks/useFavorites", () => ({
    useFavorites: () => ({
      favorites: isFav ? ["sh-1"] : [],
      loading: false,
      isFavorite: (id: string) => (isFav ? id === "sh-1" : false),
      addFavorite,
      removeFavorite,
    }),
  }));

  // FavoriteButton を動的 import（この時点のモックが反映される）
  const mod = await import("@/components/FavoriteButton");
  const FavoriteButton = pickFavoriteButton(
    mod as unknown as Record<string, unknown>
  );

  return {
    FavoriteButton,
    push,
    replace,
    prefetch,
    addFavorite,
    removeFavorite,
  };
}

/* -----------------------------------------------------------
 * テスト本体
 * ----------------------------------------------------------- */
describe("<FavoriteButton> integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = ""; // 毎回クリーン
  });

  it("未ログイン: クリックで /auth/login に誘導（ボタンが無ければ非表示を許容）", async () => {
    const { FavoriteButton, push } = await loadFavoriteButtonWithMocks({
      loggedIn: false,
    });

    const { container } = render(<FavoriteButton shelterId="sh-1" />);
    expect(container).toBeTruthy();

    const target = findClickableOptional();

    if (target) {
      await userEvent.click(target);
      // ルーティングする実装／ダイアログを出す実装など揺れを許容
      if (push.mock.calls.length > 0) {
        expect(push).toHaveBeenCalledWith("/auth/login");
      } else {
        const root = within(document.body);
        expect(root.getByText(/ログイン|sign\s*in|login/i)).toBeInTheDocument();
      }
    } else {
      // 未ログイン時は非表示にする実装も合格
      expect(screen.queryByRole("button")).toBeNull();
      expect(screen.queryByRole("link")).toBeNull();
    }
  });

  it("ログイン済: 未お気に入り → クリックで addFavorite が呼ばれる（Router は動かない）", async () => {
    const { FavoriteButton, push, addFavorite, removeFavorite } =
      await loadFavoriteButtonWithMocks({
        loggedIn: true,
        isFav: false,
      });

    render(<FavoriteButton shelterId="sh-1" />);

    const target = findClickableOptional();
    expect(target).not.toBeNull();

    if (target) {
      await userEvent.click(target);
      expect(addFavorite).toHaveBeenCalledTimes(1);
      expect(addFavorite).toHaveBeenCalledWith("sh-1");
      expect(removeFavorite).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled(); // ログイン済なので遷移しない想定
    }
  });

  it("ログイン済: 既にお気に入り → クリックで removeFavorite が呼ばれる（Router は動かない）", async () => {
    const { FavoriteButton, push, addFavorite, removeFavorite } =
      await loadFavoriteButtonWithMocks({
        loggedIn: true,
        isFav: true, // 既に登録済み
      });

    render(<FavoriteButton shelterId="sh-1" />);

    const target = findClickableOptional();
    expect(target).not.toBeNull();

    if (target) {
      await userEvent.click(target);
      expect(removeFavorite).toHaveBeenCalledTimes(1);
      expect(removeFavorite).toHaveBeenCalledWith("sh-1");
      expect(addFavorite).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    }
  });
});
