export const AUTH_MODAL_EVENT = 'cvforge:open-auth-modal'

export function openAuthModal() {
  window.dispatchEvent(new Event(AUTH_MODAL_EVENT))
}
