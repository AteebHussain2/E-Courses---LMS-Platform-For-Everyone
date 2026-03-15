const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClerkProvider>
            {children}
        </ClerkProvider>
    )
}

export default AppProvider
