import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
// Tab screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DepositsListScreen from '../screens/deposits/DepositsListScreen';
import DepositCreateScreen from '../screens/deposits/DepositCreateScreen';
import DepositDetailScreen from '../screens/deposits/DepositDetailScreen';
import LoansListScreen from '../screens/loans/LoansListScreen';
import LoanCreateScreen from '../screens/loans/LoanCreateScreen';
import LoanDetailScreen from '../screens/loans/LoanDetailScreen';
import InvestmentsListScreen from '../screens/investments/InvestmentsListScreen';
import InvestmentCreateScreen from '../screens/investments/InvestmentCreateScreen';
import InvestmentDetailScreen from '../screens/investments/InvestmentDetailScreen';
import FdrsListScreen from '../screens/fdrs/FdrsListScreen';
import FdrCreateScreen from '../screens/fdrs/FdrCreateScreen';
import FdrDetailScreen from '../screens/fdrs/FdrDetailScreen';
import BankAccountsListScreen from '../screens/bank-accounts/BankAccountsListScreen';
import BankAccountCreateScreen from '../screens/bank-accounts/BankAccountCreateScreen';
import BankAccountDetailScreen from '../screens/bank-accounts/BankAccountDetailScreen';
import UserSharesListScreen from '../screens/shares/UserSharesListScreen';
import UserShareCreateScreen from '../screens/shares/UserShareCreateScreen';
import UserShareDetailScreen from '../screens/shares/UserShareDetailScreen';
import ShareTransfersListScreen from '../screens/transfers/ShareTransfersListScreen';
import ShareTransferCreateScreen from '../screens/transfers/ShareTransferCreateScreen';
import ShareTransferDetailScreen from '../screens/transfers/ShareTransferDetailScreen';
import ApprovalsListScreen from '../screens/approvals/ApprovalsListScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import SomitiDetailScreen from '../screens/settings/SomitiDetailScreen';
import SomitiSettingsScreen from '../screens/settings/SomitiSettingsScreen';
import ReportsSummaryScreen from '../screens/reports/ReportsSummaryScreen';
import ReportsTrialBalanceScreen from '../screens/reports/ReportsTrialBalanceScreen';
import NotificationsListScreen from '../screens/settings/NotificationsListScreen';
import FinancialYearsListScreen from '../screens/settings/FinancialYearsListScreen';
import CreateSomitiScreen from '../screens/settings/CreateSomitiScreen';
import JoinSomitiScreen from '../screens/settings/JoinSomitiScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import MembersListScreen from '../screens/members/MembersListScreen';
import MemberAddScreen from '../screens/members/MemberAddScreen';
import RepaymentsListScreen from '../screens/repayments/RepaymentsListScreen';
import RepaymentCreateScreen from '../screens/repayments/RepaymentCreateScreen';
import WithdrawalsListScreen from '../screens/withdrawals/WithdrawalsListScreen';
import WithdrawalCreateScreen from '../screens/withdrawals/WithdrawalCreateScreen';
import PenaltiesListScreen from '../screens/penalties/PenaltiesListScreen';
import PenaltyCreateScreen from '../screens/penalties/PenaltyCreateScreen';
import DividendsListScreen from '../screens/dividends/DividendsListScreen';
import DividendCreateScreen from '../screens/dividends/DividendCreateScreen';
import DividendDetailScreen from '../screens/dividends/DividendDetailScreen';
import DepositReceiptScreen from '../screens/receipts/DepositReceiptScreen';

// Common layout wrapper
import ScreenLayout from '../components/ScreenLayout';
function withLayout(Component: React.ComponentType<any>) {
    return function Wrapped(props: any) {
        return <ScreenLayout><Component {...props} /></ScreenLayout>;
    };
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const navigationRef = createNavigationContainerRef<any>();

let unreadCount = 0;
let listeners: (() => void)[] = [];

export function addNotificationListener(fn: () => void) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
}

export function getUnreadCount() { return unreadCount; }

// ─── Auth Stack ───────────────────────────────────
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={withLayout(LoginScreen)} />
            <Stack.Screen name="Register" component={withLayout(RegisterScreen)} />
            <Stack.Screen name="CreateSomiti" component={withLayout(CreateSomitiScreen)} />
            <Stack.Screen name="JoinSomiti" component={withLayout(JoinSomitiScreen)} />
        </Stack.Navigator>
    );
}

// ─── Dashboard Stack ──────────────────────────────
function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardHome" component={withLayout(DashboardScreen)} />
            <Stack.Screen name="SomitiDetail" component={withLayout(SomitiDetailScreen)} />
            <Stack.Screen name="SomitiSettings" component={withLayout(SomitiSettingsScreen)} />
            <Stack.Screen name="Profile" component={withLayout(ProfileScreen)} />
            <Stack.Screen name="ChangePassword" component={withLayout(ChangePasswordScreen)} />
            <Stack.Screen name="Notifications" component={withLayout(NotificationsListScreen)} />
        </Stack.Navigator>
    );
}

// ─── Transactions Stack ──────────────────────────
function TransactionsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DepositsList" component={withLayout(DepositsListScreen)} />
            <Stack.Screen name="DepositCreate" component={withLayout(DepositCreateScreen)} />
            <Stack.Screen name="DepositDetail" component={withLayout(DepositDetailScreen)} />
            <Stack.Screen name="LoansList" component={withLayout(LoansListScreen)} />
            <Stack.Screen name="LoanCreate" component={withLayout(LoanCreateScreen)} />
            <Stack.Screen name="LoanDetail" component={withLayout(LoanDetailScreen)} />
            <Stack.Screen name="InvestmentsList" component={withLayout(InvestmentsListScreen)} />
            <Stack.Screen name="InvestmentCreate" component={withLayout(InvestmentCreateScreen)} />
            <Stack.Screen name="InvestmentDetail" component={withLayout(InvestmentDetailScreen)} />
            <Stack.Screen name="FdrsList" component={withLayout(FdrsListScreen)} />
            <Stack.Screen name="FdrCreate" component={withLayout(FdrCreateScreen)} />
            <Stack.Screen name="FdrDetail" component={withLayout(FdrDetailScreen)} />
            <Stack.Screen name="BankAccountsList" component={withLayout(BankAccountsListScreen)} />
            <Stack.Screen name="BankAccountCreate" component={withLayout(BankAccountCreateScreen)} />
            <Stack.Screen name="BankAccountDetail" component={withLayout(BankAccountDetailScreen)} />
            <Stack.Screen name="UserSharesList" component={withLayout(UserSharesListScreen)} />
            <Stack.Screen name="UserShareCreate" component={withLayout(UserShareCreateScreen)} />
            <Stack.Screen name="UserShareDetail" component={withLayout(UserShareDetailScreen)} />
            <Stack.Screen name="ShareTransfersList" component={withLayout(ShareTransfersListScreen)} />
            <Stack.Screen name="ShareTransferCreate" component={withLayout(ShareTransferCreateScreen)} />
            <Stack.Screen name="ShareTransferDetail" component={withLayout(ShareTransferDetailScreen)} />
            <Stack.Screen name="MembersList" component={withLayout(MembersListScreen)} />
            <Stack.Screen name="MemberAdd" component={withLayout(MemberAddScreen)} />
            <Stack.Screen name="RepaymentsList" component={withLayout(RepaymentsListScreen)} />
            <Stack.Screen name="RepaymentCreate" component={withLayout(RepaymentCreateScreen)} />
            <Stack.Screen name="WithdrawalsList" component={withLayout(WithdrawalsListScreen)} />
            <Stack.Screen name="WithdrawalCreate" component={withLayout(WithdrawalCreateScreen)} />
            <Stack.Screen name="PenaltiesList" component={withLayout(PenaltiesListScreen)} />
            <Stack.Screen name="PenaltyCreate" component={withLayout(PenaltyCreateScreen)} />
            <Stack.Screen name="DividendsList" component={withLayout(DividendsListScreen)} />
            <Stack.Screen name="DividendCreate" component={withLayout(DividendCreateScreen)} />
            <Stack.Screen name="DividendDetail" component={withLayout(DividendDetailScreen)} />
            <Stack.Screen name="DepositReceipt" component={withLayout(DepositReceiptScreen)} />
        </Stack.Navigator>
    );
}

// ─── More Stack ──────────────────────────────────
function MoreStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ApprovalsList" component={withLayout(ApprovalsListScreen)} />
            <Stack.Screen name="ReportsSummary" component={withLayout(ReportsSummaryScreen)} />
            <Stack.Screen name="ReportsTrialBalance" component={withLayout(ReportsTrialBalanceScreen)} />
            <Stack.Screen name="FinancialYearsList" component={withLayout(FinancialYearsListScreen)} />
            <Stack.Screen name="ProfileFromMore" component={withLayout(ProfileScreen)} />
            <Stack.Screen name="ChangePasswordFromMore" component={withLayout(ChangePasswordScreen)} />
            <Stack.Screen name="NotificationsFromMore" component={withLayout(NotificationsListScreen)} />
            <Stack.Screen name="CreateSomitiFromDash" component={withLayout(CreateSomitiScreen)} />
            <Stack.Screen name="JoinSomitiFromDash" component={withLayout(JoinSomitiScreen)} />
        </Stack.Navigator>
    );
}

// ─── Chat Stack ──────────────────────────────────
function ChatStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ChatHome" component={withLayout(ChatScreen)} />
        </Stack.Navigator>
    );
}

// ─── Tab Navigator ───────────────────────────────
function AppTabs() {
    const [badge, setBadge] = useState(0);

    useEffect(() => {
        const remove = addNotificationListener(() => setBadge(getUnreadCount()));
        return remove;
    }, []);

    useEffect(() => {
        // Listen for real-time notifications via Echo
        if (typeof window === 'undefined' || !(window as any).Echo) return;
        try {
            const channel = (window as any).Echo.join('somiti.1');
            channel.listen('.notification', (e: any) => {
                unreadCount++;
                listeners.forEach(fn => fn());
            });
            return () => { try { (window as any).Echo.leave('presence-somiti.1'); } catch {} };
        } catch {}
    }, []);

    return (
        <Tab.Navigator
            screenOptions={({ route }: any) => ({
                headerShown: false,
                tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#f1f5f9', height: 60, paddingBottom: 8, paddingTop: 4 },
                tabBarActiveTintColor: '#2563eb',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                tabBarIcon: ({ color, size }: any) => {
                    const icons: Record<string, string> = {
                        Dashboard: 'view-dashboard', Transactions: 'swap-horizontal',
                        More: 'dots-horizontal', Chat: 'chat',
                    };
                    return <Icon source={icons[route.name] || 'circle'} size={size} color={color} />;
                },
                tabBarBadge: (route as any).name === 'More' && badge > 0 ? badge : undefined,
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Transactions" component={TransactionsStack} />
            <Tab.Screen name="More" component={MoreStack} />
            <Tab.Screen name="Chat" component={ChatStack} />
        </Tab.Navigator>
    );
}

// ─── Root Navigator ─────────────────────────────
export default function AppNavigator() {
    const token = useAuthStore((s) => s.token);
    const isLoading = useAuthStore((s) => s.isLoading);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {token ? <AppTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}
