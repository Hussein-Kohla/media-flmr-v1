git mv components/ui/Input.tsx components/ui/Input.tmp
git mv components/ui/Input.tmp components/ui/input.tsx
git mv components/ui/Button.tsx components/ui/Button.tmp
git mv components/ui/Button.tmp components/ui/button.tsx
git mv components/ui/Card.tsx components/ui/Card.tmp
git mv components/ui/Card.tmp components/ui/card.tsx
git mv components/ui/SkeletonLoader.tsx components/ui/SkeletonLoader.tmp
git mv components/ui/SkeletonLoader.tmp components/ui/skeleton.tsx

git commit -m "fix: rename duplicate components to lowercase"
