export function StepIndicator(props: { current: number; total: number }) {
    return (
        <div className="ui-step-indicator" aria-label={`Step ${props.current} of ${props.total}`}>
            <div className="ui-step-track" aria-hidden="true" />
            <span>{`Step ${props.current} of ${props.total}`}</span>
            <div className="ui-step-track" aria-hidden="true" />
        </div>
    );
}
