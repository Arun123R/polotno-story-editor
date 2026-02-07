export function getPageCtas(store) {
  const page = store.activePage;
  if (!page) return [];

  return page.children.filter((el) => el.custom?.ctaType);
}

export function getMainCtas(store) {
  const pageCtas = getPageCtas(store);
  return pageCtas.filter(
    (el) =>
      el.custom?.ctaType &&
      !el.custom?.parentCtaType &&
      el.custom?.ctaType !== 'swipe_up_arrow'
  );
}
